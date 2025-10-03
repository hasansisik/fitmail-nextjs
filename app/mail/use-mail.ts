import { atom, useAtom } from "jotai"

import { Mail, mails } from "./data"

type Config = {
  selected: Mail["id"] | null
}

const configAtom = atom<Config>({
  selected: null, // Başlangıçta hiçbir mail seçili olmasın
})

export function useMail() {
  const [config, setConfig] = useAtom(configAtom)
  
  const selectMail = (mailId: Mail["id"] | null) => {
    setConfig({ selected: mailId })
  }
  
  const clearSelection = () => {
    setConfig({ selected: null })
  }
  
  return [config, { selectMail, clearSelection }] as const
}
