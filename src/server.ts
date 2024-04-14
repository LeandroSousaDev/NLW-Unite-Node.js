import { PrismaClient } from "@prisma/client";
import { fastify } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-event";

const app = fastify()
export const prisma = new PrismaClient()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent)

app.listen({ port: 3333 }).then(() => {
    console.log('Servidor rodando')
})