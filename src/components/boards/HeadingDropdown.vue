<template>
  <div class="heading-dropdown" ref="rootRef">
    <button
      type="button"
      class="hd-trigger"
      :class="{ active: open }"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <span class="hd-trigger-label">Tt</span>
      <q-icon name="arrow_drop_down" size="16px" class="hd-trigger-arrow" />
    </button>

    <Teleport to="body">
      <Transition name="hd-fade">
        <div
          v-if="open"
          ref="menuRef"
          class="hd-menu"
          role="menu"
          :style="menuStyle"
          @keydown="onKeydown"
        >
          <button
            v-for="(item, i) in items"
            :key="item.tag"
            type="button"
            role="menuitem"
            class="hd-item"
            :class="{ selected: currentTag === item.tag, focused: focusedIndex === i }"
            :ref="(el) => setItemRef(el, i)"
            @click="select(item.tag)"
            @mouseenter="focusedIndex = i"
          >
            <component :is="item.tag" class="hd-item-label">{{ item.label }}</component>
            <span class="hd-item-shortcut">{{ item.shortcut }}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  editorRef: { type: Object, default: null },
})

const items = [
  { tag: 'p', label: 'Обычный текст', shortcut: 'Ctrl+Alt+0' },
  { tag: 'h1', label: 'Заголовок 1', shortcut: 'Ctrl+Alt+1' },
  { tag: 'h2', label: 'Заголовок 2', shortcut: 'Ctrl+Alt+2' },
  { tag: 'h3', label: 'Заголовок 3', shortcut: 'Ctrl+Alt+3' },
  { tag: 'h4', label: 'Заголовок 4', shortcut: 'Ctrl+Alt+4' },
  { tag: 'h5', label: 'Заголовок 5', shortcut: 'Ctrl+Alt+5' },
  { tag: 'h6', label: 'Заголовок 6', shortcut: 'Ctrl+Alt+6' },
]

const open = ref(false)
const focusedIndex = ref(-1)
const currentTag = ref('p')
const rootRef = ref(null)
const menuRef = ref(null)
const itemRefs = ref([])
const menuStyle = ref({})

function setItemRef(el, i) {
  if (el) itemRefs.value[i] = el
}

function toggle() {
  if (open.value) {
    close()
  } else {
    openMenu()
  }
}

function openMenu() {
  detectCurrentTag()
  open.value = true
  focusedIndex.value = items.findIndex((it) => it.tag === currentTag.value)
  nextTick(() => {
    positionMenu()
    if (focusedIndex.value >= 0) {
      itemRefs.value[focusedIndex.value]?.focus()
    }
  })
}

function close() {
  open.value = false
  focusedIndex.value = -1
}

function positionMenu() {
  if (!rootRef.value) return
  const trigger = rootRef.value.querySelector('.hd-trigger')
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  menuStyle.value = {
    top: rect.bottom + 4 + 'px',
    left: rect.left + 'px',
  }
}

function detectCurrentTag() {
  const editor = props.editorRef
  if (!editor) return
  const contentEl = editor.$el?.querySelector('.q-editor__content')
  if (!contentEl) return

  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return

  let node = sel.anchorNode
  while (node && node !== contentEl) {
    if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase()
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tag)) {
        currentTag.value = tag
        return
      }
    }
    node = node.parentNode
  }
  currentTag.value = 'p'
}

function select(tag) {
  const editor = props.editorRef
  if (editor) {
    editor.runCmd('formatBlock', `<${tag}>`)
  }
  currentTag.value = tag
  close()
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value + 1) % items.length
    itemRefs.value[focusedIndex.value]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value - 1 + items.length) % items.length
    itemRefs.value[focusedIndex.value]?.focus()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (focusedIndex.value >= 0) {
      select(items[focusedIndex.value].tag)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

function onClickOutside(e) {
  if (!open.value) return
  if (rootRef.value?.contains(e.target)) return
  if (menuRef.value?.contains(e.target)) return
  close()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<style scoped lang="scss">
.heading-dropdown {
  display: inline-flex;
  position: relative;
}

.hd-trigger {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.375rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  min-height: 28px;
  min-width: 28px;
  outline: none;
  transition: background 0.15s, color 0.15s;

  &:hover,
  &.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
}

.hd-trigger-arrow {
  opacity: 0.6;
}
</style>

<style lang="scss">
/* Menu is teleported to body — must be unscoped */
.hd-menu {
  position: fixed;
  z-index: 9000;
  min-width: 240px;
  background: #1e1b38;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  padding: 0.375rem 0;
  outline: none;
}

.hd-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 0.4375rem 0.875rem;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: background 0.1s;

  &:hover,
  &.focused {
    background: rgba(255, 255, 255, 0.07);
  }

  &.selected {
    background: rgba(139, 92, 246, 0.12);

    &:hover,
    &.focused {
      background: rgba(139, 92, 246, 0.18);
    }
  }
}

.hd-item-label {
  margin: 0;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.9);
}

.hd-item p.hd-item-label  { font-size: 0.875rem;  font-weight: 400; }
.hd-item h1.hd-item-label { font-size: 1.375rem;  font-weight: 700; }
.hd-item h2.hd-item-label { font-size: 1.15rem;   font-weight: 600; }
.hd-item h3.hd-item-label { font-size: 1.0rem;    font-weight: 600; }
.hd-item h4.hd-item-label { font-size: 0.9375rem; font-weight: 500; }
.hd-item h5.hd-item-label { font-size: 0.8125rem; font-weight: 500; color: rgba(255, 255, 255, 0.65); }
.hd-item h6.hd-item-label { font-size: 0.75rem;   font-weight: 400; color: rgba(255, 255, 255, 0.45); }

.hd-item-shortcut {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  margin-left: 1.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Transition */
.hd-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.hd-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.hd-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.hd-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
