import { atom, useAtom } from "jotai"

type Config = {
  selected: string | null
}

const configAtom = atom<Config>({
  selected: null, // Başlangıçta hiçbir mail seçili olmasın
})

export function useMail() {
  const [config, setConfig] = useAtom(configAtom)
  
  const selectMail = (mailId: string | null) => {
    setConfig({ selected: mailId })
  }
  
  const clearSelection = () => {
    setConfig({ selected: null })
  }
  
  return [config, { selectMail, clearSelection }] as const
}
