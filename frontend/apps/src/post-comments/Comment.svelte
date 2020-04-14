<script>
  /* eslint no-alert: "off" */
  import dayjs from 'dayjs';
  import { createEventDispatcher } from 'svelte';
  import { _ } from '../i18n';
  import Avatar from '../Avatar.svelte';
  import EditComment from './EditComment.svelte';

  export let comment;
  export let user;
  export let editMessageId = -1;

  const dispatch = createEventDispatcher();

  function createDate(message) {
    return dayjs().to(dayjs(`${message.datetime}Z`));
  }

  function deleteComment() {
    if (window.confirm($_('Will be deleted comment. Are you sure?'))) {
      dispatch('deleteComment', comment.id);
    }
  }

  function editComment() {
    editMessageId = comment.id;
  }

  function updateComment(event) {
    editMessageId = -1;
    const { html, text } = event.detail;
    comment.html = html;
    comment.text = text;
    comment = comment;
  }
</script>

<div class="comment-row">
  {#if editMessageId !== -1}
    <EditComment bind:editMessageId={editMessageId}
                 text={comment.text.replace(/\\n+/g, '\n')}
                 on:updateComment={updateComment} />
  {:else}
    <Avatar {user} />
    <div class="comment-text">
      <div class="comment-text-head">
        <span class="name">{user.name}</span>
        <span class="sub-text">{createDate(comment)}</span>
      </div>
      <div class="comment-body">
        {@html comment.html}
      </div>
      <div class="controls">
        <span class="edit icon_edit_big"
              class:hide={window.db_user_id !== user.id}
              on:click={() => editComment()}></span>
        <span class="delete icon_delete_big"
              class:hide={!window.is_moderator}
              on:click={() => deleteComment()}></span>
      </div>
    </div>
  {/if}
</div>

<style>
  .comment-row {
    display: flex;
    align-content: center;
    margin-top: 0.5rem;
  }

  .comment-text {
    position: relative;
    width: 100%;
    min-width: 50%;
    padding-right: 0.5rem;
  }

  .comment-text-head {
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .comment-body {
    word-wrap: break-word;
    max-width: 100%;
  }

  .comment-body :global(img) {
    max-width: 100%;
  }

  .controls {
    position: absolute;
    right: 0.5rem;
    top: 0;
    height: 100%;
  }

  .edit {
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: block;
  }

  .delete {
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: block;
  }

  .hide {
    display: none;
  }
</style>