import { BaseGuildEmojiManager, Collection, type GuildEmoji } from "discord.js";
import { isRegExp } from "util/types";
import { compareStrings, replaceMentionCharacters } from "../utils";

export class Emojis {
  declare cache: BaseGuildEmojiManager["cache"];

  constructor() {
    Object.defineProperties(BaseGuildEmojiManager.prototype, {
      getById: { value: this.getById },
      getByName: { value: this.getByName },
      filterByAuthorId: { value: this.filterByAuthorId },
      filterByGuildId: { value: this.filterByGuildId },
      filterAnimateds: { value: this.filterAnimateds },
      filterStatics: { value: this.filterStatics },
      filterAvailables: { value: this.filterAvailables },
      filterUnavailables: { value: this.filterUnavailables },
      filterDeletables: { value: this.filterDeletables },
      filterUndeletables: { value: this.filterUndeletables },
      searchBy: { value: this.searchBy },
      _searchByMany: { value: this._searchByMany },
      _searchByRegExp: { value: this._searchByRegExp },
      _searchByString: { value: this._searchByString },
    });
  }

  /** @DJSProtofy */
  getById(id: string) {
    return this.cache.get(id);
  }

  /** @DJSProtofy */
  getByName(name: string | RegExp) {
    if (typeof name === "string") return this.cache.find(cached => typeof cached.name === "string" && compareStrings(cached.name, name));

    if (isRegExp(name)) return this.cache.find(cached => typeof cached.name === "string" && name.test(cached.name));
  }

  /** @DJSProtofy */
  filterByAuthorId(id: string) {
    if (typeof id !== "string") return new Collection<string, GuildEmoji>();
    return this.cache.filter(cached => cached.author?.id === id);
  }

  /** @DJSProtofy */
  filterByGuildId(id: string) {
    if (typeof id !== "string") return new Collection<string, GuildEmoji>();
    return this.cache.filter(cached => cached.guild?.id === id);
  }

  /** @DJSProtofy */
  filterAnimateds() {
    return this.cache.filter(cached => cached.animated);
  }

  /** @DJSProtofy */
  filterStatics() {
    return this.cache.filter(cached => !cached.animated);
  }

  /** @DJSProtofy */
  filterAvailables() {
    return this.cache.filter(cached => cached.available);
  }

  /** @DJSProtofy */
  filterUnavailables() {
    return this.cache.filter(cached => !cached.available);
  }

  /** @DJSProtofy */
  filterDeletables() {
    return this.cache.filter(cached => cached.deletable);
  }

  /** @DJSProtofy */
  filterUndeletables() {
    return this.cache.filter(cached => !cached.deletable);
  }

  /** @DJSProtofy */
  searchBy<T extends string>(query: T): GuildEmoji | undefined;
  searchBy<T extends RegExp>(query: T): GuildEmoji | undefined;
  searchBy<T extends Search>(query: T): GuildEmoji | undefined;
  searchBy<T extends string | RegExp | Search>(query: T): GuildEmoji | undefined;
  searchBy<T extends string | RegExp | Search>(query: T[]): Collection<string, GuildEmoji>;
  searchBy<T extends string | RegExp | Search>(query: T | T[]) {
    if (Array.isArray(query)) return this._searchByMany(query);
    if (typeof query === "string") return this._searchByString(query);
    if (isRegExp(query)) return this._searchByRegExp(query);

    return typeof query.id === "string" && this.cache.get(query.id) ||
      this.cache.find(cached =>
        typeof cached.name === "string" && (
          typeof query.name === "string" && compareStrings(query.name, cached.name) ||
          isRegExp(query.name) && query.name.test(cached.name)
        ));
  }

  /** @DJSProtofy */
  protected _searchByMany(queries: (string | RegExp | Search)[]) {
    const cache: this["cache"] = new Collection();
    for (const query of queries) {
      const result = this.searchBy(query);
      if (result) cache.set(result.id, result);
    }
    return cache;
  }

  /** @DJSProtofy */
  protected _searchByRegExp(query: RegExp) {
    return this.cache.find((cached) => typeof cached.name === "string" && query.test(cached.name));
  }

  /** @DJSProtofy */
  protected _searchByString(query: string) {
    query = replaceMentionCharacters(query).toLowerCase();
    return this.cache.get(query) ??
      this.cache.find((cached) => [
        cached.name?.toLowerCase(),
      ].includes(query));
  }
}

interface Search {
  id?: string
  name?: string | RegExp
}
