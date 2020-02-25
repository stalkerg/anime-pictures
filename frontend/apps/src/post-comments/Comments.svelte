<script>
  import { onMount } from 'svelte';
  import { _, language } from '../i18n';
  import Spinner from '../Spinner.svelte';
  import Separator from '../Separator.svelte';
  import Comment from './Comment.svelte';
  import EditComment from './EditComment.svelte';

  let loader = true;
  let comments = [];
  
  async function loadComments() {
    const response = await fetch(
      `/api/v3/posts/${window.post_id}/comments?lang=${$language}`,
      { credentials: 'same-origin' },
    );
    ({ comments } = await response.json());
    comments = comments.map((currentValue, index, array) => {
      if (index !== 0) {
        return { ...currentValue, prev: array[index - 1] };
      }
      return currentValue;
    });
    loader = false;
  }

  function addComment(event) {
    let { detail } = event;
    if (comments.length > 0) {
      detail = { ...detail, prev: comments[comments.length - 1] };
    }
    comments = [...comments, detail];
  }

  async function deleteComment({ detail }) {
    let response;
    try {
      response = await fetch(
        `/api/v3/comments/${detail}`,
        {
          credentials: 'same-origin',
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.log(error);
      return;
    }

    const responseJson = await response.json();
    if (!responseJson.success) {
      console.log(responseJson.errormsg);
      return;
    }

    comments = comments
      .filter(comment => comment.comment.id !== detail)
      .map((currentValue, index, array) => {
        if (index !== 0) {
          return { ...currentValue, prev: array[index - 1] };
        }
        return currentValue;
      });
  }

  onMount(loadComments);
</script>

<div class="post_content">
  <div class="title">
    {$_('Comments')}
    <a href="#/"
      title="{$_('About comments(desc)')}"
      class="question_icon"
      onclick="return false"> </a>
  </div>
  <div class="comments-body">
    {#if loader}
      <div class="spinner">
        <Spinner />
      </div>
    {/if}
    <div class="post-comments">
      {#each comments as {comment, user, prev}, index (comment.id)}
        <Separator prevDate={prev ? `${prev.comment.datetime}Z` : null} currentDate={`${comment.datetime}Z`} />
        <Comment {comment} {user} on:deleteComment={deleteComment} />
      {/each}
    </div>

    {#if window.is_login}
      <EditComment on:addComment={addComment} />
    {/if}
  </div>
</div>

<style>
  .post_content {
    min-width: 90%;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .comments-body {
    padding: 0 10px;
  }

  .spinner {
    text-align: center;
  }
</style>