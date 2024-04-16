import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getAttendeeBadge(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/attendees/:attendeeId/badge', {
            schema: {
                summary: 'busca um participante distinto',
                tags: ['attendees'],
                params: z.object({
                    attendeeId: z.coerce.number().int()
                }),
                response: {
                    200: z.object({
                        badge: z.object({
                            name: z.string(),
                            email: z.string().email(),
                            eventTitle: z.string(),
                            checkinURL: z.string().url()
                        })
                    })
                }
            }
        }, async (req, res) => {

            const { attendeeId } = req.params

            const attendee = await prisma.attendee.findUnique({
                where: {
                    id: attendeeId
                },
                select: {
                    name: true,
                    email: true,
                    event: {
                        select: {
                            title: true
                        }
                    }
                }
            })

            if (!attendee) {
                throw new Error('Participante não encontrado')
            }

            const baseURL = `${req.protocol}://${req.hostname}`

            const checkinURL = new URL(`attendees/${attendeeId}/check-in`, baseURL)

            return res.send({
                badge: {
                    name: attendee.name,
                    email: attendee.email,
                    eventTitle: attendee.event.title,
                    checkinURL: checkinURL.toString()
                }
            })
        })
}