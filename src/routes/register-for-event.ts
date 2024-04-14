import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { promise, z } from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events/:eventId/attendees', {
            schema: {
                body: z.object({
                    name: z.string().min(4),
                    email: z.string().email()
                }),
                params: z.object({
                    eventId: z.string().uuid()
                }),
                response: {
                    201: z.object({
                        attendeeId: z.number()
                    })
                }
            }
        }, async (req, res) => {
            const { eventId } = req.params
            const { name, email } = req.body

            const attendeeFromEmail = await prisma.attendee.findUnique({
                where: {
                    eventId_email: {
                        email, eventId
                    }
                }
            })

            if (attendeeFromEmail) {
                throw new Error('Esse email ja registrado neste evento')
            }

            const [amountAttendeesForEvent, event] = await Promise.all([
                prisma.attendee.count({
                    where: {
                        eventId
                    }
                }),
                prisma.event.findUnique({
                    where: {
                        id: eventId
                    }
                })
            ])

            if (event?.maximumAttndees && amountAttendeesForEvent >= event?.maximumAttndees) {
                throw new Error('este evento ja tem o numero maxio de participantes')
            }

            const attendee = await prisma.attendee.create({
                data: {
                    name,
                    email,
                    eventId
                }
            })
            return res.status(201).send({ attendeeId: attendee.id })
        })

}