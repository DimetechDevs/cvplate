import type { Cv } from '../model/types'
import { Editor } from './Editor'
import { Preview } from './Preview'

/** Editor and live preview. Loaded on demand so the start page doesn't pay for the PDF engine. */
export default function Workspace({ cv, tab, setTab }: { cv: Cv; tab: 'edit' | 'preview'; setTab: (t: 'edit' | 'preview') => void }) {
  return (
    <div className="workspace" data-tab={tab}>
      <div className="mobile-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')}>
          Edit
        </button>
        <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
          Preview
        </button>
      </div>
      <div className="editor-pane">
        <Editor cv={cv} />
      </div>
      <Preview cv={cv} />
    </div>
  )
}
