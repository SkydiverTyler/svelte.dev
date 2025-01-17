---
title: Customizing use:enhance
---

With `use:enhance`, we can go further than just emulating the browser's native behaviour. By providing a callback, we can add things like **pending states** and **optimistic UI**. Let's simulate a slow network by adding an artificial delay to our two actions:

```js
/// file: src/routes/+page.server.js
export const actions = {
	create: async ({ cookies, request }) => {
		+++await new Promise((fulfil) => setTimeout(fulfil, 1000));+++
		...
	},

	delete: async ({ cookies, request }) => {
		+++await new Promise((fulfil) => setTimeout(fulfil, 1000));+++
		...
	}
};
```

When we create or delete items, it now takes a full second before the UI updates, leaving the user wondering if they messed up somehow. To solve that, add some local state...

```svelte
/// file: src/routes/+page.svelte
<script>
	import { fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

+++	let creating = $state(false);
	let deleting = $state([]);+++
</script>
```

...and toggle `creating` inside the first `use:enhance`:

```svelte
/// file: src/routes/+page.svelte
<form
	method="POST"
	action="?/create"
+++	use:enhance={() => {
		creating = true;

		return async ({ update }) => {
			await update();
			creating = false;
		};
	}}+++
>
	<label>
		add a todo:
		<input
			+++disabled={creating}+++
			name="description"
			value={form?.description ?? ''}
			autocomplete="off"
			required
		/>
	</label>
</form>
```

We can then show a message while we're saving data:

```svelte
/// file: src/routes/+page.svelte
<ul class="todos">
	<!-- ... -->
</ul>

+++{#if creating}
	<span class="saving">saving...</span>
{/if}+++
```

In the case of deletions, we don't really need to wait for the server to validate anything — we can just update the UI immediately:

```svelte
/// file: src/routes/+page.svelte
<ul class="todos">
	{#each +++data.todos.filter((todo) => !deleting.includes(todo.id))+++ as todo (todo.id)}
		<li in:fly={{ y: 20 }} out:slide>
			<form
				method="POST"
				action="?/delete"
				+++use:enhance={() => {
					deleting = [...deleting, todo.id];
					return async ({ update }) => {
						await update();
						deleting = deleting.filter((id) => id !== todo.id);
					};
				}}+++
			>
				<input type="hidden" name="id" value={todo.id} />
				<button aria-label="Mark as complete">✔</button>

				{todo.description}
			</form>
		</li>
	{/each}
</ul>
```

> [!NOTE] `use:enhance` is very customizable — you can `cancel()` submissions, handle redirects, control whether the form is reset, and so on. [See the docs](https://kit.svelte.dev/docs/modules#$app-forms-enhance) for full details.
