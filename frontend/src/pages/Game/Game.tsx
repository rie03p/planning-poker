import { useLocalStorage } from "../../hooks/useLocalStorage"
import { useParams } from "react-router-dom"
import { JoinDialog } from './components/JoinDialog'

export function Game() {
  const { gameId } = useParams<{ gameId: string }>()
  if (!gameId) throw new Error('gameId is required')

  const {
    value: name,
    setValue: setName,
  } = useLocalStorage<string>('planning-poker:name', '')

  // const game = name ? useGame(gameId, name) : null

  return (
    <>
      <JoinDialog isOpen={!name} onJoin={setName} />
    </>
  )
}