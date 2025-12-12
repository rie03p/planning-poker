export class Room {
  constructor(private state: DurableObjectState) {}

  async fetch() {
    return new Response("room alive");
  }
}
