import { UpdatePrompt } from './UpdatePrompt.tsx'

export function App() {
  return (
    <>
      <main class="hello">
        <h1>Hallo Drache!</h1>
        <p>Drachen-Arena kommt bald.</p>
        <small>v{__APP_BUILD__}</small>
      </main>
      <UpdatePrompt />
    </>
  )
}
