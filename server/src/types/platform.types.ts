export interface RawPlatformCategory {
  externalId: string;
  parentExternalId: string | null;
  name: string;
  isLeaf: boolean;
  depth: number;
}
