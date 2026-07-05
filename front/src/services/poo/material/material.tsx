import { RoleBase } from "../shared/RoleBase";

import {
  Database,
  LoggedUser,
  AttachmentEntity,
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

  abstract getMaterial(id: number): AttachmentEntity | null;

  abstract updateMaterial(
    id: number,
    data: Partial<AttachmentEntity>,
  ): AttachmentEntity | null;
}