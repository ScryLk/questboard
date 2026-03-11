import { EventNode } from "./event-node";
import { ChoiceNode } from "./choice-node";
import { ConsequenceNode } from "./consequence-node";
import { ChapterNode } from "./chapter-node";

export const narrativeNodeTypes = {
  event: EventNode,
  choice: ChoiceNode,
  consequence: ConsequenceNode,
  chapter: ChapterNode,
};
