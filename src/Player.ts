import { UUID, randomUUID } from "crypto";

export class Player {
    constructor(private readonly name: string, private readonly id: UUID = randomUUID()) {}
}