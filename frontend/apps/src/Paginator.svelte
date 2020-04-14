<script>
  /* eslint no-continue: "off" */
  import { createEventDispatcher } from 'svelte';

  export let page;
  export let count;
  export let limit;

  $: maxPages = Math.ceil(count / limit);

  function* pagesGenerator() {
    let index = 0;
    while (index < maxPages) {
      if (Math.abs(index - page) < 3) {
        yield index;
      } else if (index < page) {
        index = page - 2;
        continue;
      } else {
        break;
      }

      index += 1;
    }
  }

  $: pages = [...pagesGenerator(page, count, limit)];

  const dispatch = createEventDispatcher();
</script>

<p class="numeric_pages">
  {#if page > 0}
    <a href="#/" on:click|preventDefault={() => dispatch('setPage', 0)}>&lt;</a>
  {/if}
  {#each pages as p}
    {#if page === p}
      <span class="active">{p}</span>
    {:else}
      <a href="#/" on:click|preventDefault={() => dispatch('setPage', p)}>{p}</a>
    {/if}
  {/each}
  {#if page < maxPages - 1}
    <a href="#/" on:click|preventDefault={() => dispatch('setPage', maxPages - 1)}>&gt;</a>
  {/if}
</p>

<style>
  .numeric_pages {
    padding-top: 0;
    padding-bottom: 0;
    text-align: center;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>