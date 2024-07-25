<template>
	<view class="container">
		<!-- 滚动列表 -->
		<scroll-view class="scroll-view" scroll-y>
			<wd-picker id="a" :columns="columns" label="单列选项" v-model="value" />
			<wd-select-picker id="b" label="基本用法" v-model="value" :columns="columns" />
			<view id="c" style="background-color: aqua; height: 500px"></view>
			<wd-picker id="d" :columns="columns" label="单列选项" v-model="value" />
			<wd-select-picker id="e" label="基本用法" v-model="value" :columns="columns" />
			<wd-picker id="f" :columns="columns" label="单列选项" v-model="value" />
			<wd-select-picker id="g" label="基本用法" v-model="value" :columns="columns" />
		</scroll-view>


		<!-- 底部保存按钮 -->
		<view class="footer">
			<wd-button>保存</wd-button>
		</view>
	</view>
</template>
<script setup>
	import {
		ref
	} from 'vue'
	const columns = ref([{
			value: '101',
			label: '男装',
		},
		{
			value: '102',
			label: '奢侈品',
		},
		{
			value: '103',
			label: '女装',
		},
	])
	const value = ref(['101'])
</script>
<style scoped>
	view {
	  box-sizing: border-box;
	}
	.container {
		display: flex;
		flex-direction: column;
		widows: 100vw;
		height: 100vh;
	}

	.scroll-view {
		height: calc(100vh - 100px);
		background-color: forestgreen;
		padding: 20px 0;
	}

	.footer {
		height: 100px;
		text-align: center;
		background-color: red;
	}
</style>