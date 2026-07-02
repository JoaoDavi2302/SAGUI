import { RoleBase } from "../shared/RoleBase";

import {
  Database,
  LoggedUser,
  MaterialEntity,
  MaterialCard,
} from "../shared/types";

export abstract class Material extends RoleBase {
  constructor(
    protected database: Database,
    protected user: LoggedUser,
  ) {
    super(database, user);
  }

  abstract listMaterials(): MaterialCard[];

  abstract getMaterial(id: string): MaterialEntity | null;

  abstract updateMaterial(
    id: string,
    data: Partial<MaterialEntity>,
  ): MaterialEntity | null;
}