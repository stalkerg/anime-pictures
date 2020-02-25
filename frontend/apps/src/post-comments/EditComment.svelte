<script>
  /* global grecaptcha */
  import { createEventDispatcher } from 'svelte';
  import { _ } from '../i18n';
  import BBTags from '../BBTags.svelte';
  import Spinner from '../Spinner.svelte';

  export let text = '';
  let textarea;
  let disableInput = false;
  export let editMessageId = -1;
  let errorMessage = '';
  let captchaScriptLoaded = false;

  const dispatch = createEventDispatcher();

  function loadScript(src) {
    return new Promise((resolve) => {
      let r = false;
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = src;
      s.onload = () => {
        if (!r && (!s.readyState || s.readyState === 'complete')) {
          r = true;
          resolve();
        }
      };
      s.onreadystatechange = s.onload;
      const t = document.getElementsByTagName('script')[0];
      t.parentNode.insertBefore(s, t);
    });
  }

  function getCaptcha() {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute('6LekE2wUAAAAAMLyxxd5Iz5HC1owZ6yQXxYMuNYO', { action: 'add_comment' })
          .then(resolve, reject);
      });
    });
  }

  async function addComment() {
    if (disableInput) {
      return;
    }
    disableInput = true;
    let token;
    if (!captchaScriptLoaded) {
      await loadScript('https://www.google.com/recaptcha/api.js?render=6LekE2wUAAAAAMLyxxd5Iz5HC1owZ6yQXxYMuNYO');
      captchaScriptLoaded = true;
    }
    try {
      token = await getCaptcha();
    } catch (error) {
      errorMessage = error;
      console.log(error);
      disableInput = false;
      return;
    }

    let response;
    try {
      response = await fetch(
        `/api/v3/posts/${window.post_id}/comments`,
        {
          credentials: 'same-origin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            token,
          }),
        },
      );
    } catch (error) {
      console.log(error);
      return;
    } finally {
      disableInput = false;
    }

    const responseJson = await response.json();
    if (!responseJson.success) {
      errorMessage = responseJson.errormsg;
      return;
    }

    errorMessage = '';
    dispatch('addComment', responseJson.comment);
    text = '';
  }

  async function updateComment() {
    if (disableInput) {
      return;
    }
    disableInput = true;
    let response;
    try {
      response = await fetch(
        `/api/v3/comments/${editMessageId}`,
        {
          credentials: 'same-origin',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
          }),
        },
      );
    } catch (error) {
      console.log(error);
      return;
    } finally {
      disableInput = false;
    }

    const responseJson = await response.json();
    if (!responseJson.success) {
      errorMessage = responseJson.errormsg;
      return;
    }

    errorMessage = '';
    dispatch('updateComment', { html: responseJson.html, text });
    text = '';
  }

  function keydownHandle(event) {
    const keynum = event.which || event.keyCode;
    if ((event.ctrlKey || event.metaKey) && keynum === 13) {
      if (editMessageId !== -1) {
        addComment();
      } else {
        updateComment();
      }
    }
  }

  function cancelEditComment() {
    text = '';
    editMessageId = -1;
  }
</script>

<div class="input">
  {#if errorMessage !== ''}
    <div class="error">
      {errorMessage}
    </div>
  {/if}
  <div class="first-line">
    <BBTags disable={disableInput} {textarea} bind:text={text} />
    <div>
      {#if editMessageId !== -1}
        <button disabled={disableInput}
                on:click|stopPropagation={updateComment}
        >{$_('Save')} (Ctrl+Enter)</button>
        <button on:click|stopPropagation={cancelEditComment}>{$_('Cancel')}</button>
      {:else}
         <button disabled={disableInput}
                on:click|stopPropagation={addComment}
        >{$_('Add')} (Ctrl+Enter)</button>
      {/if}
    </div>
  </div>
  {#if disableInput}
    <div class="spinner">
      <Spinner />
    </div>
  {/if}
  <textarea disabled={disableInput}
            onblur="return false;"
            on:keydown={keydownHandle}
            bind:this={textarea}
            bind:value={text}></textarea>
</div>

<style>
  .input {
    margin-top: 10px;
    width: 100%;
    position: relative;
  }

  .first-line {
    display: flex;
    align-content: center;
    justify-content: space-between;
  }

  .input button {
    border: none;
    border-radius: 3px;
    padding: .3rem .5rem;
    font-weight: 400;
    color: #2f2f2f;
    background: #d5d5d5;
    cursor: pointer;
  }

  textarea {
    width: 100%;
    height: 50px;
    padding: 0;
    margin: 10px 0;
    resize: none;
  }

  .error {
    color: red;
  }
  .spinner {
    text-align: center;
    position: absolute;
    left: 50%;
    margin-left: -30px;
  }
</style>