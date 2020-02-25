<script>
  export let disable;
  export let text;
  export let textarea;
  const bbParams = ['b', 'i', 'u', 'quote', 'code', 'img', 'url', 'spoiler'];

  function getSelText() {
    let txt = '';
    if (window.getSelection) {
      txt = window.getSelection();
    } else if (document.getSelection) {
      txt = document.getSelection();
    } else if (document.selection) {
      txt = document.selection.createRange().text;
    } else return '';

    return txt.toString();
  }

  function addBBCode(param) {
    if (disable) {
      return;
    }
    const sel = getSelText();
    textarea.focus();
    if (typeof textarea.selectionStart === 'number'
        && typeof textarea.selectionEnd === 'number'
        && textarea.selectionStart !== textarea.selectionEnd
    ) {
      // All browsers except IE
      const selectedText = text.slice(
        textarea.selectionStart,
        textarea.selectionEnd,
      );
      const before = text.slice(0, textarea.selectionStart);
      const after = text.slice(textarea.selectionEnd);

      text = `${before}[${param}]${selectedText}[/${param}]${after}`;
    } else {
      text += `[${param}]${sel}[/${param}]`;
    }
  }
</script>

<style>
  .bbtags {
    text-align: left;
    display: inline-block;
  }

  a {
    text-transform: uppercase;
    display: inline-block;
    padding-right: 0.2rem;
  }

  @media all and (max-width: 1000px) {
    .bbtags {
      display: none;
    }
  }
</style>

<div class="bbtags">
  {#each bbParams as param}
    <a href="/" on:click|preventDefault={() => addBBCode(param)}>[{param}]</a>
  {/each}
</div>