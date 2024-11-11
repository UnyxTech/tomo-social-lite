import { createRoot } from 'react-dom/client'

import Demo from 'components/Demo'

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)

root.render(<Demo />)
