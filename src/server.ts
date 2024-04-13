import { fastify } from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const app = fastify()
const prisma = new PrismaClient()

app.post('/events', async (req, res) => {

    const createEventSchema = z.object({
        title: z.string().min(4),
        details: z.string().nullable(),
        maximumAttndees: z.number().int().positive().nullable()
    })

    const data = createEventSchema.parse(req.body)

    const event = await prisma.event.create({
        data: {
            title: data.title,
            details: data.details,
            maximumAttndees: data.maximumAttndees,
            slug: new Date().toISOString()
        }
    })

    return res.status(201).send({ eventID: event.id })
})

app.listen({ port: 3333 }).then(() => {
    console.log('Servidor rodando')
})