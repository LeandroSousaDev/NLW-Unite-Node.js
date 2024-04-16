import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { generateSlug } from "../utils/generate-slug"
import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"


export async function createEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events', {
            schema: {
                summary: 'criar um evwento',
                tags: ['events'],
                body: z.object({
                    title: z.string().min(4),
                    details: z.string().nullable(),
                    maximumAttndees: z.number().int().positive().nullable()
                }),
                response: {
                    201: z.object({
                        eventID: z.string().uuid()
                    })
                }
            }
        }, async (req, res) => {

            const { title, details, maximumAttndees } = req.body

            const slug = generateSlug(title)

            const eventWithSemeSlug = await prisma.event.findUnique({
                where: {
                    slug
                }
            })

            if (eventWithSemeSlug) {
                throw new Error('Este evento ja esta registrado')
            }

            const event = await prisma.event.create({
                data: {
                    title,
                    details,
                    maximumAttndees,
                    slug
                }
            })

            return res.status(201).send({ eventID: event.id })
        })
}