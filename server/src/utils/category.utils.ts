import { RawPlatformCategory } from '../types/platform.types';

interface CategoryTreeItem {
  id: string | number;
  name: string;
  children?: CategoryTreeItem[];
}

export function flattenCategoryTree(
  items: CategoryTreeItem[],
  parentId: string | null = null,
  depth = 0,
): RawPlatformCategory[] {
  const result: RawPlatformCategory[] = [];
  for (const item of items) {
    const externalId = String(item.id);
    const children = item.children ?? [];
    result.push({ externalId, parentExternalId: parentId, name: item.name, isLeaf: children.length === 0, depth });
    if (children.length > 0) {
      result.push(...flattenCategoryTree(children, externalId, depth + 1));
    }
  }
  return result;
}
