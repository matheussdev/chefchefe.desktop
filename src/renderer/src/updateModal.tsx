import { Modal, Progress, Button } from 'antd'
import { useEffect, useState } from 'react'

export function UpdaterModal() {
  const [open, setOpen] = useState(false)

  const [progress, setProgress] = useState(0)

  const [downloaded, setDownloaded] =
    useState(false)

  useEffect(() => {
    window.api.onUpdaterAvailable(() => {
      setOpen(true)
    })

    window.api.onUpdaterProgress(
      (_, progress) => {
        setProgress(progress.percent)
      }
    )

    window.api.onUpdaterDownloaded(() => {
      setDownloaded(true)
    })
  }, [])

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
    >
      <h2>Atualização disponível</h2>

      {!downloaded && (
        <>
          <p>
            Baixando nova versão do ChefChefe...
          </p>

          <Progress percent={Math.floor(progress)} />
        </>
      )}

      {downloaded && (
        <>
          <p>
            Atualização pronta para instalar.
          </p>

          <Button
            type="primary"
            block
            onClick={() => {
              window.api.installUpdate()
            }}
          >
            Atualizar agora
          </Button>
        </>
      )}
    </Modal>
  )
}