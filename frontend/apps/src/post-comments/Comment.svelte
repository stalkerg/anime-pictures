<script>
  /* eslint no-alert: "off" */
  import dayjs from 'dayjs';
  import { createEventDispatcher } from 'svelte';
  import { genAvatarUrl } from '../helpers';
  import { _, language } from '../i18n';
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
    <div class="comment-avatar sub-text">
      <img src="{genAvatarUrl(user)}"
           alt="{user.name} avatar"
           title="{$_('profile')}"
           on:mouseup|preventDefault={() => window.open(`/profile/view_ext_profile/${user.id}?lang=${$language}`)}>
    </div>
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
    /* border-bottom: 1px solid #d5d5d5; */
  }

  .comment-avatar {
    margin-right: 1.0rem;
    margin-left: 0.5rem;
    width: 4rem;
    max-width: 4rem;
    min-width: 4rem;
    /* min-height: 5rem; */
    text-align: center;
  }

  .comment-avatar img {
    max-width: 100%;
    cursor: pointer;
    /* border-radius: 50%; */
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

  /* .comment-text-head .name {
    cursor: pointer;
  } */

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