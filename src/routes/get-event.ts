import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/events/:eventId', {
            schema: {
                summary: 'busca um evento',
                tags: ['events'],
                params: z.object({
                    eventId: z.string().uuid()
                }),
                response: {
                    200: z.object({
                        event: z.object({
                            id: z.string().uuid(),
                            title: z.string(),
                            slug: z.string(),
                            details: z.string().nullable(),
                            maximumAttendees: z.number().int().nullable(),
                            attendeesAmount: z.number().int()
                        })
                    })
                }
            }
        }, async (req, res) => {
            const { eventId } = req.params

            const event = await prisma.event.findUnique({
                where: {
                    id: eventId
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    details: true,
                    maximumAttndees: true,
                    _count: {
                        select: {
                            Attendee: true
                        }
                    }
                }
            })

            if (!event) {
                throw new Error("evento não encontrado")
            }

            return res.send({
                event: {
                    id: event.id,
                    title: event.title,
                    slug: event.slug,
                    details: event.details,
                    maximumAttendees: event.maximumAttndees,
                    attendeesAmount: event._count.Attendee,
                }
            })
        })
}