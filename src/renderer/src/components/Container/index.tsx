import { Flex } from 'antd'

export const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Flex
      style={{
        height: 'calc(100vh - 4rem)',
        padding: '1rem',
        gap: '1rem'
      }}
    >
      {children}
    </Flex>
  )
}
