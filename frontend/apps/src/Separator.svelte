<script>
  import dayjs from 'dayjs';

  export let prevDate;
  export let currentDate;
  export let isEdit = false;
  export let showToday = true;

  $: showDate = (
    prevDate == null
    || dayjs(currentDate).date() !== dayjs(prevDate).date()
  ) && (showToday || dayjs(currentDate).date() !== dayjs().date());
</script>

<div class="separator" class:is-edit={isEdit}>
  {#if showDate}
    <span class="unique-day sub-text">{dayjs(currentDate).format('LL')}</span>
  {:else}
    <hr class="line">
  {/if}
</div>

<style>
  .separator hr {
    border: none;
    border-bottom: 1px solid #d5d5d5;
  }

  .separator.is-edit hr {
    border-bottom-color: #ff5959;
  }

  .separator .unique-day {
    text-align: center;
    display: flex;
    align-items: center;
  }

  .separator .unique-day:before {
    right: 100%;
    margin-right: 8px;
    content: "";
    background-color: #d5d5d5;
    height: 1px;
    flex: 1 1 auto;
  }

  .separator.is-edit .unique-day:before {
    background-color: #ff5959;
  }

  .separator .unique-day:after {
    left: 100%;
    margin-left: 8px;
    content: "";
    background-color: #d5d5d5;
    height: 1px;
    flex: 1 1 auto;
  }

  .separator.is-edit .unique-day:after {
    background-color: #ff5959;
  }
</style>