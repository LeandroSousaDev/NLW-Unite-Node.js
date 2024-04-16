import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function checkId(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/attendees/:attendeeId/check-in', {
            schema: {
                summary: 'fazer check-in do participante',
                tags: ['check-ins'],
                params: z.object({
                    attendeeId: z.coerce.number().int()
                }),
                response: {
                    201: z.null()
                }
            }
        }, async (req, res) => {

            const { attendeeId } = req.params

            const attendeeCheckIn = await prisma.checkId.findUnique({
                where: {
                    attendeeId
                }
            })

            if (attendeeCheckIn) {
                throw new Error('participante ja fez check-in')
            }

            await prisma.checkId.create({
                data: {
                    attendeeId
                }
            })

            return res.status(201).send()
        })
}