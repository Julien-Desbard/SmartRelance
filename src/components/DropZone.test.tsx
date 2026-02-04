import * as React from 'react'
import {render, screen} from '@testing-library/react'
import Hero from './Hero'

// Tests pertinents :

// Unit tests (Vitest + React Testing Library) :

// Rendu initial avec texte par défaut ==> Good
// État "dragging" affiche le bon texte
// État "uploading" affiche le bon texte
// Les classes CSS changent selon l'état


// Integration test :

// Simuler un drop de fichier PDF → vérifier que startUpload est appelé

jest.mock('@/utils/uploadthing', () => ({
  useUploadThing: () => ({
    startUpload: jest.fn(),
    isUploading: false,
  }),
}))

describe('hero', () => {
    test('renders hero component', () => {
        render(<Hero/>)
    })
    test('check text by default', () => {
        render(<Hero/>)
        expect(screen.getByText('Glissez votre facture PDF ici')).toBeInTheDocument()
        expect(screen.getByText('Ou cliquez pour parcourir')).toBeInTheDocument()
        expect(screen.queryByText('Upload en cours...')).toBeNull()
        expect(screen.queryByText('On glisse...')).toBeNull()
        expect(screen.queryByText('...et on relâche ICI')).toBeNull()
    })
})