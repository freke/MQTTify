import { expect, test } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks"
import { beforeAll, afterEach } from 'vitest'
import { Topic } from "./topics_tree.svelte";

beforeAll(() => {
  mockIPC((cmd, args) => {
  });
})

afterEach(() => {
  clearMocks()
})

test("a", async () => {
  const topic_tree = await import("./topics_tree.svelte");
  let topic = new Topic("host.com");
  topic.add(["host.com","a"], 1);
  let sub_topics = topic.sub_topics();
  console.log(JSON.stringify(topic));
  expect(topic.topic).toBe("host.com");
  expect(topic.payload).toBe(undefined);
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe('a');
  expect(topic_a.payload).toBe(1);

  expect(topic.message_counter()).toBe(1);
  expect(topic_a.message_counter()).toBe(1);
});

test("/b", async () => {
  const topic_store = await import("./topics_tree.svelte");
  const topic = new Topic("host.com");
  topic.add(["host.com","","b"], "1");
  expect(topic.topic).toEqual("host.com");
  let sub_topics = topic.sub_topics();
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("");
  let sub_topics_a = topic_a.sub_topics();
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("b");
  let sub_topics_b = topic_b.sub_topics();
  expect(sub_topics_b.length).toBe(0);

  expect(topic.message_counter()).toBe(1);
  expect(topic_a.message_counter()).toBe(1);
  expect(topic_b.message_counter()).toBe(1);
});

test("a/b", async () => {
  const topic_store = await import("./topics_tree.svelte");
  const topic = new Topic("host.com");
  topic.add(["host.com","a","b"], "1");
  expect(topic.topic).toEqual("host.com");
  let sub_topics = topic.sub_topics();
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("a");
  let sub_topics_a = topic_a.sub_topics();
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("b");
  let sub_topics_b = topic_b.sub_topics();
  expect(sub_topics_b.length).toBe(0);

  expect(topic.message_counter()).toBe(1);
  expect(topic_a.message_counter()).toBe(1);
  expect(topic_b.message_counter()).toBe(1);
});

test("//c", async () => {
  const topic_store = await import("./topics_tree.svelte");
  const topic = new Topic("host.com");
  topic.add(["host.com","","","c"], "1");
  expect(topic.topic).toEqual("host.com");
  let sub_topics = topic.sub_topics();
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("");
  let sub_topics_a = topic_a.sub_topics();
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("");
  let sub_topics_b = topic_b.sub_topics();
  expect(sub_topics_b.length).toBe(1);

  let topic_c = sub_topics_b[0];
  expect(topic_c.topic).toBe("c");
  let sub_topics_c = topic_c.sub_topics();
  expect(sub_topics_c.length).toBe(0);
  expect(topic_c.payload).toBe('1');

  expect(topic.message_counter()).toBe(1);
  expect(topic_a.message_counter()).toBe(1);
  expect(topic_b.message_counter()).toBe(1);
  expect(topic_c.message_counter()).toBe(1);
});

test("a/b/c", async () => {
  const topic_store = await import("./topics_tree.svelte");
  const topic = new Topic("host.com");
  topic.add(["host.com","a","b","c"], "1");
  expect(topic.topic).toEqual("host.com");
  let sub_topics = topic.sub_topics();
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("a");
  let sub_topics_a = topic_a.sub_topics();
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("b");
  let sub_topics_b = topic_b.sub_topics();
  expect(sub_topics_b.length).toBe(1);

  let topic_c = sub_topics_b[0];
  expect(topic_c.topic).toBe("c");
  let sub_topics_c = topic_c.sub_topics();
  expect(sub_topics_c.length).toBe(0);
  expect(topic_c.payload).toBe('1');

  expect(topic.message_counter()).toBe(1);
  expect(topic_a.message_counter()).toBe(1);
  expect(topic_b.message_counter()).toBe(1);
  expect(topic_c.message_counter()).toBe(1);
});

test("a/b|c", async () => {
  const topic_store = await import("./topics_tree.svelte");
  const topic = new Topic("host.com");
  topic.add(["host.com","a","c"], "1");
  topic.add(["host.com","a","b"], "1");

  console.log(JSON.stringify(topic));
  expect(topic.topic).toEqual("host.com");
  let sub_topics = topic.sub_topics();
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("a");
  let sub_topics_a = topic_a.sub_topics();
  expect(sub_topics_a.length).toBe(2);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("b");
  let sub_topics_b = topic_b.sub_topics();
  expect(sub_topics_b.length).toBe(0);

  let topic_c = sub_topics_a[1];
  expect(topic_c.topic).toBe("c");
  let sub_topics_c = topic_c.sub_topics();
  expect(sub_topics_c.length).toBe(0);
  expect(topic_c.payload).toBe('1');

  expect(topic.message_counter()).toBe(2);
  expect(topic_a.message_counter()).toBe(2);
  expect(topic_b.message_counter()).toBe(1);
  expect(topic_c.message_counter()).toBe(1);
});

test("FCF5C4A08028 FCF5C4A08028/sensor", async () => {
  const topic_store = await import("./topics_tree.svelte");
  const topic = new Topic("host.com");
  topic.add(["host.com","FCF5C4A08028 FCF5C4A08028","sensor"], "1");
  let sub_topics = topic.sub_topics();
  expect(sub_topics.length).toBe(1);

  let topic_a = sub_topics[0];
  expect(topic_a.topic).toBe("FCF5C4A08028 FCF5C4A08028");
  let sub_topics_a = topic_a.sub_topics();
  expect(sub_topics_a.length).toBe(1);

  let topic_b = sub_topics_a[0];
  expect(topic_b.topic).toBe("sensor");
  let sub_topics_b = topic_b.sub_topics();
  expect(sub_topics_b.length).toBe(0);
});