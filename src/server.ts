import { fastify } from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateSlug } from "./utils/generate-slug";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

const app = fastify()
const prisma = new PrismaClient()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events', {
        schema: {
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

app.listen({ port: 3333 }).then(() => {
    console.log('Servidor rodando')
})