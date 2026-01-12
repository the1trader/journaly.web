'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Plus, Undo2, Redo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type BlockType = 'text' | 'image'

export interface Block {
    id: string
    type: BlockType
    content: string
}

interface NotionBlockEditorProps {
    initialContent?: Block[]
    onChange: (blocks: Block[]) => void
    placeholder?: string
}

interface ImageZoomState {
    src: string
    originalRect: DOMRect
    isZooming: boolean
    isZoomed: boolean
}

export function NotionBlockEditor({ initialContent, onChange, placeholder }: NotionBlockEditorProps) {
    const [blocks, setBlocks] = useState<Block[]>(
        initialContent && initialContent.length > 0
            ? initialContent
            : [{ id: crypto.randomUUID(), type: 'text', content: '' }]
    )

    // Undo/Redo History
    const [history, setHistory] = useState<Block[][]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const isInternalUpdate = useRef(false)

    // Image Zoom State
    const [zoomState, setZoomState] = useState<ImageZoomState | null>(null)
    const zoomedImageRef = useRef<HTMLImageElement>(null)

    // Track focus to handle navigation between blocks
    const blockRefs = useRef<(HTMLTextAreaElement | null)[]>([])

    // Push to history when blocks change
    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false
            return
        }

        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(JSON.parse(JSON.stringify(blocks)))
        
        if (newHistory.length > 50) {
            newHistory.shift()
        } else {
            setHistoryIndex(prev => prev + 1)
        }
        
        setHistory(newHistory)
        onChange(blocks)
    }, [blocks])

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            isInternalUpdate.current = true
            const prevBlocks = history[historyIndex - 1]
            setBlocks(JSON.parse(JSON.stringify(prevBlocks)))
            setHistoryIndex(historyIndex - 1)
        }
    }, [history, historyIndex])

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            isInternalUpdate.current = true
            const nextBlocks = history[historyIndex + 1]
            setBlocks(JSON.parse(JSON.stringify(nextBlocks)))
            setHistoryIndex(historyIndex + 1)
        }
    }, [history, historyIndex])

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Handle Esc to close zoom
            if (e.key === 'Escape' && zoomState?.isZoomed) {
                closeZoom()
                return
            }

            // Handle Undo/Redo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) {
                    e.preventDefault()
                    redo()
                } else {
                    e.preventDefault()
                    undo()
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault()
                redo()
            }
        }
        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [undo, redo, zoomState])

    // Handle scroll to close zoom
    useEffect(() => {
        if (!zoomState?.isZoomed) return

        const handleScroll = () => {
            closeZoom()
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [zoomState])

    const openZoom = (src: string, imgElement: HTMLImageElement) => {
        const rect = imgElement.getBoundingClientRect()
        setZoomState({
            src,
            originalRect: rect,
            isZooming: true,
            isZoomed: false
        })

        // Trigger zoom animation after a brief delay
        setTimeout(() => {
            setZoomState(prev => prev ? { ...prev, isZoomed: true } : null)
        }, 10)
    }

    const closeZoom = () => {
        setZoomState(prev => prev ? { ...prev, isZoomed: false } : null)
        setTimeout(() => {
            setZoomState(null)
        }, 300) // Match transition duration
    }

    const addBlock = (index: number, type: BlockType = 'text', content: string = '') => {
        const newBlock: Block = { id: crypto.randomUUID(), type, content }
        const newBlocks = [...blocks]
        newBlocks.splice(index + 1, 0, newBlock)
        setBlocks(newBlocks)

        setTimeout(() => {
            if (type === 'text' && blockRefs.current[index + 1]) {
                blockRefs.current[index + 1]?.focus()
            }
        }, 0)
    }

    const updateBlock = (index: number, content: string) => {
        const newBlocks = [...blocks]
        newBlocks[index].content = content
        setBlocks(newBlocks)
    }

    const removeBlock = (index: number) => {
        if (blocks.length === 1 && blocks[0].type === 'text') {
            updateBlock(0, '')
            return
        }

        const newBlocks = blocks.filter((_, i) => i !== index)
        setBlocks(newBlocks)

        setTimeout(() => {
            if (index > 0 && blockRefs.current[index - 1]) {
                blockRefs.current[index - 1]?.focus()
            }
        }, 0)
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            addBlock(index)
        }
        if (e.key === 'Backspace' && blocks[index].content === '' && blocks.length > 1) {
            e.preventDefault()
            removeBlock(index)
        }
    }

    const handlePaste = (e: React.ClipboardEvent, index: number) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault()
                const file = items[i].getAsFile()
                if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const result = event.target?.result as string
                        if (blocks[index].type === 'text' && blocks[index].content.trim() === '') {
                            const newBlocks = [...blocks]
                            newBlocks[index] = { ...newBlocks[index], type: 'image', content: result }
                            newBlocks.splice(index + 1, 0, { id: crypto.randomUUID(), type: 'text', content: '' })
                            setBlocks(newBlocks)
                        } else {
                            const newBlocks = [...blocks]
                            const imgBlock: Block = { id: crypto.randomUUID(), type: 'image', content: result }
                            const txtBlock: Block = { id: crypto.randomUUID(), type: 'text', content: '' }
                            newBlocks.splice(index + 1, 0, imgBlock, txtBlock)
                            setBlocks(newBlocks)
                        }
                    }
                    reader.readAsDataURL(file)
                }
                return
            }
        }
    }

    const getZoomTransform = () => {
        if (!zoomState) return {}

        const { originalRect, isZoomed } = zoomState
        
        if (!isZoomed) {
            // Initial state - image at original position
            return {
                transform: `translate(${originalRect.left}px, ${originalRect.top}px)`,
                width: `${originalRect.width}px`,
                height: `${originalRect.height}px`,
                opacity: 1
            }
        }

        // Calculate zoomed state
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const maxWidth = viewportWidth * 0.9
        const maxHeight = viewportHeight * 0.9

        // Get natural image dimensions from the zoomed image ref
        const img = zoomedImageRef.current
        if (!img) return {}

        const naturalRatio = img.naturalWidth / img.naturalHeight
        let zoomedWidth = maxWidth
        let zoomedHeight = zoomedWidth / naturalRatio

        if (zoomedHeight > maxHeight) {
            zoomedHeight = maxHeight
            zoomedWidth = zoomedHeight * naturalRatio
        }

        const left = (viewportWidth - zoomedWidth) / 2
        const top = (viewportHeight - zoomedHeight) / 2

        return {
            transform: `translate(${left}px, ${top}px)`,
            width: `${zoomedWidth}px`,
            height: `${zoomedHeight}px`,
            opacity: 1
        }
    }

    return (
        <div className="space-y-4 min-h-[200px] flex flex-col w-full relative group">
            {/* Toolbar for Undo/Redo */}
            <div className="absolute -top-12 right-0 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8">
                    <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8">
                    <Redo2 className="h-4 w-4" />
                </Button>
            </div>

            {blocks.map((block, index) => (
                <div key={block.id} className="relative group/block flex items-start w-full">
                    <div className="absolute -left-8 top-1 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center pr-2 cursor-grab select-none">
                        <div className="text-slate-300 hover:text-slate-500 p-1" title="Add block below" onClick={() => addBlock(index)}>
                            <Plus className="h-4 w-4" />
                        </div>
                    </div>

                    {block.type === 'text' ? (
                        <textarea
                            ref={el => { blockRefs.current[index] = el }}
                            value={block.content}
                            onChange={(e) => {
                                updateBlock(index, e.target.value)
                                e.target.style.height = 'auto'
                                e.target.style.height = e.target.scrollHeight + 'px'
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={(e) => handlePaste(e, index)}
                            placeholder={index === 0 ? placeholder || "Start typing or paste an image..." : "Type more or paste images..."}
                            className="w-full resize-none overflow-hidden bg-transparent outline-none text-xl leading-relaxed py-1 min-h-[28px] border-none focus:ring-0 placeholder:text-slate-300"
                            rows={1}
                            style={{ height: 'auto' }}
                        />
                    ) : (
                        <div className="relative w-full my-4 group/image">
                            <div 
                                className="cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md"
                                onClick={(e) => {
                                    const imgElement = e.currentTarget.querySelector('img')
                                    if (imgElement) {
                                        openZoom(block.content, imgElement)
                                    }
                                }}
                            >
                                <img 
                                    src={block.content} 
                                    alt="Content" 
                                    className="w-full h-auto block" 
                                />
                            </div>
                            <button
                                type="button"
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-md opacity-0 group-hover/image:opacity-100 transition-opacity z-10"
                                onClick={() => removeBlock(index)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <div
                className="flex-1 cursor-text min-h-[100px]"
                onClick={() => {
                    const lastIdx = blocks.length - 1
                    if (blocks[lastIdx].type === 'text') {
                        blockRefs.current[lastIdx]?.focus()
                    } else {
                        addBlock(lastIdx)
                    }
                }}
            />

            {/* Medium-zoom style Image Zoom */}
            {zoomState && (
                <>
                    {/* Backdrop */}
                    <div 
                        className={`fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300 ease-out z-[9998] ${
                            zoomState.isZoomed ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={closeZoom}
                    />
                    
                    {/* Zoomed Image */}
                    <img
                        ref={zoomedImageRef}
                        src={zoomState.src}
                        alt="Zoomed"
                        className="fixed cursor-zoom-out z-[9999] object-contain transition-all duration-300 ease-[cubic-bezier(0.2,0,0.2,1)]"
                        style={{
                            ...getZoomTransform(),
                            transformOrigin: 'top left'
                        }}
                        onClick={closeZoom}
                        onLoad={() => {
                            // Re-trigger transform calculation after image loads
                            if (zoomState.isZoomed) {
                                setZoomState(prev => prev ? { ...prev } : null)
                            }
                        }}
                    />
                </>
            )}
        </div>
    )
}
