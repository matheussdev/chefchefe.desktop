import { Card, Form, FormInstance, Input, Typography } from 'antd'
import { Search } from 'lucide-react'
import React, { useEffect } from 'react'
import { NumberPad } from '../NumberPad'
import { useHotkeys } from 'react-hotkeys-hook'
const { Text } = Typography

interface SearchBoxProps {
  onSearch?: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number'
  startF?: () => void
  srtartFocus?: boolean
  onTimeSearch?: (value: string) => void
  onArrow?: (direction: 'up' | 'down') => void
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  onTimeSearch,
  placeholder,
  type = 'number',
  startF,
  srtartFocus,
  onArrow
}) => {
  const form = React.useRef<FormInstance>(null)
  useHotkeys(
    ['ctrl+r', 'meta+r', 'F5'],
    () => {
      window.api.reloadApp()
    },
    { enableOnContentEditable: true, keydown: false, keyup: true }
  )
  useHotkeys(
    '*',
    (handle) => {
      // iff number or letter key is pressed without ctrl or meta
      if (handle.ctrlKey || handle.metaKey) return
      if (
        (handle.key.length === 1 && /[a-zA-Z0-9]/.test(handle.key)) ||
        (type != 'number' && handle.key.length === 1 && /\d/.test(handle.key))
      ) {
        form.current?.getFieldInstance('search')?.focus()
        form.current?.setFieldsValue({ search: handle.key })
      }
      if (handle.key === 'Escape') {
        form.current?.getFieldInstance('search')?.blur()
      }
    },
    { enableOnContentEditable: false, keydown: false, keyup: true }
  )
  useEffect(() => {
    setTimeout(() => {
      if (srtartFocus) {
        form.current?.getFieldInstance('search')?.focus()
      }
      startF?.()
    }, 200)
  }, [startF, srtartFocus])
  return (
    <Card
      style={{
        minWidth: '270px',
        height: 'fit-content'
      }}
      styles={{
        body: {
          padding: '1rem'
        }
      }}
    >
      <Form
        ref={form}
        onFinish={(values) => {
          onSearch?.(values.search)
        }}
      >
        <Form.Item name="search">
          <Input
            type="tel"
            size="large"
            prefix={<Search />}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                form.current?.getFieldInstance('search')?.blur()
              }
            }}
            id="search-input-t"
            placeholder={placeholder || 'Nº da comanda'}
            onKeyUp={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault()
                onArrow?.(e.key === 'ArrowUp' ? 'up' : 'down')
              }
            }}
            onChange={(e) => {
              let value = e.target.value
              if (type === 'number') {
                value = value.replace(/\D/g, '')
              }
              onTimeSearch?.(value)
              form.current?.setFieldsValue({ search: value })
            }}
          />
        </Form.Item>
      </Form>
      <NumberPad
        onFinish={() => {
          form.current?.submit()
        }}
        onClick={(value) => {
          const current = form.current?.getFieldValue('search') || ''
          form.current?.getFieldInstance('search')?.focus()
          form.current?.setFieldsValue({ search: current + value })
        }}
        onClear={() => {
          form.current?.getFieldInstance('search')?.focus()
          form.current?.setFieldsValue({ search: '' })
        }}
        onDelete={() => {
          const current = form.current?.getFieldValue('search') || ''
          form.current?.getFieldInstance('search')?.focus()
          form.current?.setFieldsValue({ search: current.slice(0, -1) })
        }}
      />
      <Text
        type="secondary"
        style={{ fontSize: '0.7rem', marginTop: '0.5rem', display: 'block', textAlign: 'center' }}
      >
        (F) BUSCAR | (R) RECARREGAR |
      </Text>
    </Card>
  )
}
