import { fireEvent, render, screen } from '@testing-library/react'
import Hero from './Hero'
import { act } from 'react'

const fonctionUpload = jest.fn()
let mockIsUploading = false

jest.mock('@/utils/uploadthing', () => ({
	useUploadThing: () => ({
		startUpload: fonctionUpload,
		isUploading: mockIsUploading,
	}),
}))

describe('hero', () => {
	test('renders hero component', () => {
		render(<Hero />)
	})
	test('text by default', () => {
		render(<Hero />)
		expect(
			screen.getByText('Glissez votre facture PDF ici'),
		).toBeInTheDocument()
		expect(screen.getByText('Ou cliquez pour parcourir')).toBeInTheDocument()
		expect(screen.queryByText('Upload en cours...')).toBeNull()
		expect(screen.queryByText('On glisse...')).toBeNull()
		expect(screen.queryByText('...et on relâche ICI')).toBeNull()
	})
	test('style by default', () => {
		render(<Hero />)
		const dropZone = screen.getByTestId('dropzone')
		expect(dropZone).toHaveClass('border-2', 'rounded-lg', 'bg-gray-900')
	})
	test('text when dragging=true', () => {
		render(<Hero />)
		fireEvent.dragEnter(window)
		expect(screen.getByText('On glisse...')).toBeInTheDocument()
		expect(screen.getByText('...et on relâche ICI')).toBeInTheDocument()
	})
	test('style when dragging=true', () => {
		render(<Hero />)
		fireEvent.dragEnter(window)
		const dropZone = screen.getByTestId('dropzone')
		expect(dropZone).toHaveClass('border-dashed', 'border-[#06D6A0]')
	})
	test('text when dragleave', () => {
		render(<Hero />)
		fireEvent.dragLeave(window)
		expect(
			screen.getByText('Glissez votre facture PDF ici'),
		).toBeInTheDocument()
		expect(screen.getByText('Ou cliquez pour parcourir')).toBeInTheDocument()
	})
	test('startUpload is called when uploading a file', async () => {
		render(<Hero />)
		const dropZone = screen.getByTestId('dropzone')
		const fileDropped = new File([''], 'fichier_de_test.pdf', {
			type: 'application/pdf',
		})
		await act(async () => {
			fireEvent.drop(dropZone, {
				dataTransfer: {
					files: [fileDropped],
					types: ['Files'],
				},
			})
		})
		expect(fonctionUpload).toHaveBeenCalled()
	})
	test('text is correct when uploading=true', () => {
		mockIsUploading = true
		render(<Hero />)
		expect(screen.queryByText('Upload en cours...')).toBeInTheDocument()
	})
	test('style is correct when uploading=true', () => {
		mockIsUploading = true
		render(<Hero />)
		const dropZone = screen.getByTestId('dropzone')
		expect(dropZone).toHaveClass('border-solid', 'border-[#06D6A0]')
	})
})
