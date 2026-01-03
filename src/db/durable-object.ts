import { SqliteDurableObject } from "rwsdk/db";
import { migrations } from "@/db/migrations";

export class AppDurableObject extends SqliteDurableObject {
  migrations = migrations;
}

