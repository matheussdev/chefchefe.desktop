import { Alert, Button, Modal, Progress } from 'antd'
import { useEffect, useState } from 'react'

export function UpdaterModal() {
  const [open, setOpen] = useState(false)

  const [checking, setChecking] = useState(false)

  const [installing, setInstalling] = useState(false)

  const [downloaded, setDownloaded] = useState(false)

  const [progress, setProgress] = useState(0)

  const [error, setError] = useState('')

  useEffect(() => {
    window.api.onUpdaterChecking(() => {
      setChecking(true)

      setInstalling(false)

      setDownloaded(false)

      setError('')

      setOpen(true)
    })

    window.api.onUpdaterAvailable(() => {
      setChecking(false)

      setInstalling(true)

      setOpen(true)
    })

    window.api.onUpdaterProgress((_, progress) => {
      setInstalling(true)

      setProgress(progress.percent)
    })

    window.api.onUpdaterDownloaded(() => {
      setChecking(false)

      setInstalling(false)

      setDownloaded(true)

      setProgress(100)
    })

    window.api.onUpdaterError((_, error: string) => {
      setChecking(false)

      setInstalling(false)

      setError(error)

      setOpen(true)
    })

    window.api.onUpdaterNotAvailable(() => {
      setChecking(false)

      setInstalling(false)

      setDownloaded(false)

      setOpen(false)
    })
  }, [])

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      mask={{
        closable: false
      }}
    >
      <h2>Atualização do ChefChefe</h2>

      {checking && <p>Verificando atualizações...</p>}

      {error && <Alert type="error" showIcon message="Erro ao atualizar" description={error} />}

      {installing && (
        <>
          <p>Baixando nova versão...</p>

          <Progress percent={Math.floor(progress)} />
        </>
      )}

      {downloaded && !error && (
        <>
          <p>Nova versão baixada com sucesso.</p>

          <Button
            type="primary"
            block
            onClick={() => {
              window.api.installUpdate()
            }}
          >
            Reiniciar e instalar
          </Button>
        </>
      )}
    </Modal>
  )
}
