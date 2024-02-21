import { expect, test } from "vitest";
import {get} from 'svelte/store'

import { clearMocks, mockIPC } from "@tauri-apps/api/mocks"
import { beforeAll, afterEach } from 'vitest'

beforeAll(() => {
  mockIPC((cmd, args) => {
  });
})

afterEach(() => {
  clearMocks()
})


test("a", async () => {
  const topic_store = await import("./topic_store");
  const topic = new topic_store.Topic();
  topic.add("a", 1);
  expect(topic.topic).toEqual(undefined);
  let topics_a = get(topic.sub_topics);
  expect(topics_a.length).toBe(1);
  expect(topics_a[0].topic).toBe("a");
  expect(topics_a[0].payload).toBe(1);
  expect(get(topic.message_counter)).toBe(1);
  expect(get(topics_a[0].message_counter)).toBe(1);
});

test("a/b/c", async () => {
  const topic_store = await import("./topic_store");
  const topic = new topic_store.Topic();
  topic.add("a/b/c", "1");
  expect(topic.topic).toEqual(undefined);
  let sub_topics = get(topic.sub_topics);
  expect(sub_topics.length).toBe(1);
  
  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("a");
  let sub_topics_a = get(topic_a.sub_topics);
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("b");
  let sub_topics_b = get(topic_b.sub_topics);
  expect(sub_topics_b.length).toBe(1);

  let topic_c = sub_topics_b[0];
  expect(topic_c.topic).toBe("c");
  let sub_topics_c = get(topic_c.sub_topics);
  expect(sub_topics_c.length).toBe(0);
  expect(topic_c.payload).toBe('1');

  expect(get(topic.message_counter)).toBe(1);
  expect(get(topic_a.message_counter)).toBe(1);
  expect(get(topic_b.message_counter)).toBe(1);
  expect(get(topic_c.message_counter)).toBe(1);
});

test("message counter", async () => {
  const topic_store = await import("./topic_store");
  const topic = new topic_store.Topic();
  topic.add("a/b/c", "1");
  topic.add("a/b/d", "2");
  expect(topic.topic).toEqual(undefined);
  let sub_topics = get(topic.sub_topics);
  expect(sub_topics.length).toBe(1);
  
  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("a");
  let sub_topics_a = get(topic_a.sub_topics);
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("b");
  let sub_topics_b = get(topic_b.sub_topics);
  expect(sub_topics_b.length).toBe(2);

  let topic_c = sub_topics_b[0];
  expect(topic_c.topic).toBe("c");
  let sub_topics_c = get(topic_c.sub_topics);
  expect(sub_topics_c.length).toBe(0);
  expect(topic_c.payload).toBe('1');

  let topic_d = sub_topics_b[1];
  expect(topic_d.topic).toBe("d");
  let sub_topics_d = get(topic_d.sub_topics);
  expect(sub_topics_d.length).toBe(0);
  expect(topic_d.payload).toBe('2');


  expect(get(topic.message_counter)).toBe(2);
  expect(get(topic_a.message_counter)).toBe(2);
  expect(get(topic_b.message_counter)).toBe(2);
  expect(get(topic_c.message_counter)).toBe(1);
  expect(get(topic_d.message_counter)).toBe(1);
});