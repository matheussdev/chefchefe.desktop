import { Button, Flex } from 'antd'
import React, { useCallback } from 'react'

interface NumberPadProps {
  onClick?: (value: string) => void
  onClear?: () => void
  onDelete?: () => void
  onFinish?: () => void
}

const PadButton: React.FC<{ value: string; onClick: (value: string) => void }> = ({
  value,
  onClick
}) => {
  return (
    <Button size="large" block type="dashed" onClick={() => onClick(value)}>
      {value}
    </Button>
  )
}

export const NumberPad: React.FC<NumberPadProps> = ({ onClick, onClear, onDelete, onFinish }) => {
  const handleButtonClick = useCallback(
    (value: string) => {
      if (onClick) {
        onClick(value)
      }
    },
    [onClick]
  )
  return (
    <Flex gap={'0.2rem'} style={{ marginTop: '1rem' }}>
      <Flex vertical gap="0.2rem" style={{ width: '67%' }}>
        <Flex gap="0.2rem">
          <PadButton value="7" onClick={handleButtonClick} />
          <PadButton value="8" onClick={handleButtonClick} />
          <PadButton value="9" onClick={handleButtonClick} />
        </Flex>
        <Flex gap="0.2rem">
          <PadButton value="4" onClick={handleButtonClick} />
          <PadButton value="5" onClick={handleButtonClick} />
          <PadButton value="6" onClick={handleButtonClick} />
        </Flex>
        <Flex gap="0.2rem">
          <PadButton value="1" onClick={handleButtonClick} />
          <PadButton value="2" onClick={handleButtonClick} />
          <PadButton value="3" onClick={handleButtonClick} />
        </Flex>
        <Flex>
          <PadButton value="0" onClick={handleButtonClick} />
        </Flex>
      </Flex>
      <Flex vertical style={{ width: '33%' }} gap="0.2rem">
        <Button
          size="large"
          block
          style={{
            height: '25%'
          }}
          type="dashed"
          onClick={onDelete}
        >
          Apagar
        </Button>
        <Button
          size="large"
          block
          style={{
            height: '37.5%'
          }}
          danger
          type="dashed"
          onClick={onClear}
        >
          Limpar
        </Button>
        <Button
          size="large"
          block
          type="primary"
          style={{
            height: '37.5%'
          }}
          onClick={onFinish}
        >
          Abrir
        </Button>
      </Flex>
    </Flex>
  )
}
