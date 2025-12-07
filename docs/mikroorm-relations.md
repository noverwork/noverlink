# MikroORM 關聯載入

## 定義

```typescript
@ManyToOne(() => Author, { ref: true })
author!: Ref<Author>;
```

## 查詢

```typescript
const book = await repository.findOne(Book, 1, { populate: ['author'] });
```

## 存取

```typescript
book.author.$.name
```

## 賦值

```typescript
book.author = ref(author);
book.author = ref(Author, authorId);
```

**就這樣。**
