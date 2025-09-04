'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import React, { useState, type FormEvent } from 'react'
import { askQuestion } from './actions'
import { readStreamableValue } from '@ai-sdk/rsc'

const AskQuestionClient = () => {
    const {project} = useProject()
    const [question, setQuestion] = useState()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] =  useState(false)
    const [fileReferences, setFileReferences] = useState<{fileName: string; sourceCode: string; summary: string}[]>([])
    const [answer, setAnswer] = useState('')

    const onSubmit = async(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)
        setOpen(true)

        const {output, filesReferences} = await askQuestion(question!, project.id)
        setFileReferences(filesReferences)

        for await (const delta of readStreamableValue(output)){
            if(delta){
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <Image src='/logo.png' alt='logo' width={40} height={40}/>
                        </DialogTitle>
                    </DialogHeader>
                    {answer}
                    <h1>Files References</h1>
                    {fileReferences.map(file=>{
                        return <span>{file.fileName}</span>
                    })}
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'>
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which file should I edit to change the homepage?'/>
                        <div className='h-4'></div>
                        <Button type='submit'>
                            Ask BranchMind!
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionClient