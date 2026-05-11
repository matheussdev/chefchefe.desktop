import { Avatar, Button, Card, Flex, Input, Tag, theme, Typography } from 'antd'
import { Search } from 'lucide-react'
import React from 'react'
import { useBill } from '@renderer/hooks/useBills'
const { Text } = Typography
export const TablesPage: React.FC = () => {
  const token = theme.useToken().token
  const { tables, fetchTables } = useBill()
  const render = React.useRef(false)
  React.useEffect(() => {
    if (!render.current) {
      fetchTables()
      render.current = true
    }
  }, [fetchTables])
  return (
    <Flex
      style={{
        height: 'calc(100vh - 5rem)',
        padding: '1rem',
        gap: '1rem'
      }}
    >
      <Flex
        vertical
        style={{
          width: '100%'
        }}
        gap="1rem"
      >
        <Flex wrap="wrap" gap="0.2rem">
          <Text
            strong
            style={{
              marginRight: '0.5rem'
            }}
          >
            Mesas
          </Text>
          <Tag
            style={{
              borderRadius: '10px',
              fontSize: '0.8rem'
            }}
          >
            Todas {tables.length}
          </Tag>
          <Tag
            color="green"
            style={{
              borderRadius: '10px',
              fontSize: '0.8rem'
            }}
          >
            Livres {tables.filter((table) => table.count === 0).length}
          </Tag>
          <Tag
            style={{
              borderRadius: '10px',
              fontSize: '0.8rem'
            }}
            color="red"
          >
            Ocupadas {tables.filter((table) => table.count > 0).length}
          </Tag>
        </Flex>
        <div
          style={{
            width: '100%',
            height: 'fit-content',
            maxHeight: '100%',
            flexWrap: 'wrap',
            flexDirection: 'row',
            overflow: 'auto',
            gap: '0.5rem',
            display: 'flex'
          }}
        >
          {tables.map((table) => (
            <Card
              key={table.id}
              hoverable
              style={{
                width: 'calc(20% - 0.5rem)',
                maxWidth: '120px',
                height: 'fit-content'
              }}
              styles={{
                body: {
                  padding: '0.4rem'
                }
              }}
            >
              <Flex align="center" justify="space-between" gap="0.2rem">
                <Flex vertical>
                  <Text strong>Mesa</Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '0.7rem'
                    }}
                  >
                    {table.count > 0 ? 'Ocupada' : 'Livre'}
                  </Text>
                </Flex>
                <Avatar
                  style={{
                    backgroundColor:
                      table.count > 0 ? token.colorErrorBgFilledHover : token.colorPrimary,
                    color: token.colorTextLightSolid,
                    fontWeight: 'bold'
                  }}
                  size={30}
                >
                  {String(table.number).padStart(2, '0')}
                </Avatar>
              </Flex>
            </Card>
          ))}
        </div>
      </Flex>
      {window.innerWidth > 845 && (
        <Card
          style={{
            width: '40%',
            maxWidth: '300px',
            minWidth: '270px',
            height: 'fit-content'
          }}
          styles={{
            body: {
              padding: '1rem'
            }
          }}
        >
          <Input size="large" prefix={<Search />} placeholder="Nº da mesa" />
          {/* numberpad */}
          <Flex gap={'0.2rem'} style={{ marginTop: '1rem' }}>
            <Flex vertical gap="0.2rem" style={{ width: '67%' }}>
              <Flex gap="0.2rem">
                <Button size="large" block type="dashed">
                  7
                </Button>
                <Button size="large" block type="dashed">
                  8
                </Button>
                <Button size="large" block type="dashed">
                  9
                </Button>
              </Flex>
              <Flex gap="0.2rem">
                <Button size="large" block type="dashed">
                  4
                </Button>
                <Button size="large" block type="dashed">
                  5
                </Button>
                <Button size="large" block type="dashed">
                  6
                </Button>
              </Flex>
              <Flex gap="0.2rem">
                <Button size="large" block type="dashed">
                  1
                </Button>
                <Button size="large" block type="dashed">
                  2
                </Button>
                <Button size="large" block type="dashed">
                  3
                </Button>
              </Flex>
              <Flex>
                <Button size="large" block type="dashed">
                  0
                </Button>
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
              >
                Abrir
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}
    </Flex>
  )
}
