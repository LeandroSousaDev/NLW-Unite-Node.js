import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { resolve } from "path";

export async function getEventAttendees(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/events/:eventId/attendees', {
            schema: {
                summary: 'busca participantes do evento ',
                tags: ['events'],
                params: z.object({
                    eventId: z.string().uuid()
                }),
                querystring: z.object({
                    query: z.string().nullish(),
                    pageIndex: z.string().nullable().default('0').transform(Number)
                }),
                response: {
                    200: z.object({
                        attendees: z.array(
                            z.object({
                                id: z.number(),
                                name: z.string(),
                                email: z.string().email(),
                                createAt: z.date(),
                                checkInAt: z.date().nullable()
                            })
                        )
                    })
                }
            }
        }, async (req, res) => {

            const { eventId } = req.params
            const { pageIndex, query } = req.query

            const attendees = await prisma.attendee.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createAt: true,
                    CheckId: {
                        select: {
                            createAt: true
                        }
                    }
                },
                where: query ? {
                    eventId,
                    name: {
                        contains: query
                    }
                } : { eventId },
                take: 10,
                skip: pageIndex * 10,
                orderBy: {
                    createAt: 'desc'
                }
            })

            return res.send({
                attendees: attendees.map(item => {
                    return {
                        id: item.id,
                        name: item.name,
                        email: item.email,
                        createAt: item.createAt,
                        checkInAt: item.CheckId?.createAt ?? null
                    }
                })
            })
        })
}