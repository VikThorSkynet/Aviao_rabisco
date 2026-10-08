import { WorldModel } from "./model.js";
let world;
self.onmessage = ({ data }) => {
  try {
    if (data.seed !== undefined) {
      world = new WorldModel(data.seed);
      return;
    }
    const chunk = world.generateChunk(data.cx, data.cz, data.segments);
    self.postMessage({ id: data.id, chunk }, [
      chunk.vertices.buffer,
      chunk.colors.buffer,
      chunk.indices.buffer,
    ]);
  } catch (e) {
    self.postMessage({ id: data.id, error: e.message });
  }
};
