<template>
	<view>
		<tip-card title="工艺包参数设置">
			<view v-if="weldParamList.length>0" class="form-container">
				<uni-forms :modelValue="formData">
					<uni-forms-item label="工艺包名称" label-width="350rpx">
						<uni-data-select v-model="weldParam" :localdata="weldParamList" class="disabled-input uni-input"
							@change="change"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="焊枪摆幅（mm）" label-width="350rpx">
						<uni-easyinput type="text" disabled v-model="formData.amplitude"
							class="disabled-input uni-input" />
					</uni-forms-item>

					<uni-forms-item label="焊机电流（A）" label-width="350rpx">
						<uni-easyinput type="text" disabled v-model="formData.electric"
							class="disabled-input uni-input" />
					</uni-forms-item>

					<uni-forms-item label="焊枪行进速度（mm/s）" label-width="350rpx">
						<uni-easyinput type="text" disabled v-model="formData.speed" class="disabled-input uni-input" />
					</uni-forms-item>

					<uni-forms-item label="焊机弧长校正电压（V）" label-width="350rpx">
						<uni-easyinput type="text" disabled v-model="formData.voltage"
							class="disabled-input uni-input" />
					</uni-forms-item>
				</uni-forms>
			</view>

			<view v-else class="add-param" @click="handleOpenDialog">
				<uni-icons type="redo-filled" class="add-content" color="#00c3ff"></uni-icons><text
					class="add-text add-content">新增工艺包配置</text>


				<!-- 弹框 -->
				<uni-popup ref="popup" type="center" @change="changeDialog">
					<view class="popup-box">
						<view class="popup-title">新增工艺包</view>

						<!-- 表单 -->
						<uni-forms :modelValue="newForm" ref="addForm" label-width="350rpx" :rules="rules">
							<uni-forms-item label="工艺包名称" name="name" required>
								<uni-easyinput v-model="newForm.name" placeholder="请输入工艺包名称" />
							</uni-forms-item>
							<uni-forms-item label="焊枪摆幅（mm）" name="amplitude" required>
								<uni-easyinput type="number" v-model="newForm.amplitude" placeholder="请输入摆幅" />
							</uni-forms-item>
							<uni-forms-item label="焊机电流（A）" name="electric" required>
								<uni-easyinput type="number" v-model="newForm.electric" placeholder="请输入电流" />
							</uni-forms-item>
							<uni-forms-item label="焊枪行进速度（mm/s）" name="speed" required>
								<uni-easyinput type="number" v-model="newForm.speed" placeholder="请输入速度" />
							</uni-forms-item>
							<uni-forms-item label="焊机弧长校正电压（V）" name="voltage" required>
								<uni-easyinput type="number" v-model="newForm.voltage" placeholder="请输入电压" />
							</uni-forms-item>
						</uni-forms>
						<!-- 按钮 -->
						<view class="popup-footer">
							<button size="mini" class="btn" type="primary" @click="submitForm">确认</button>
							<button size="mini" class="btn" @click="closePopup">取消</button>
						</view>
					</view>
				</uni-popup>
			</view>
		</tip-card>
	</view>
</template>

<script>
	import TipCard from '@/components/tip-card/index.vue'
	export default {
		components: {
			TipCard
		},
		data() {
			return {
				// weldParamList: [{
				// 		value: 1,
				// 		text: '工艺包 A',
				// 		amplitude: 5,
				// 		electric: 120,
				// 		speed: 30,
				// 		voltage: 24
				// 	},
				// 	{
				// 		value: 2,
				// 		text: '工艺包 B',
				// 		amplitude: 6,
				// 		electric: 150,
				// 		speed: 35,
				// 		voltage: 26
				// 	}
				// ],
				weldParamList: [],
				weldParam: 1, // 默认选中第一个工艺包的 value
				formData: {
					amplitude: '',
					electric: '',
					speed: '',
					voltage: ''
				},
				newForm: {
					name: '',
					amplitude: '',
					electric: '',
					speed: '',
					voltage: ''
				},
				rules: {
					name: {
						rules: [{
								required: true,
								errorMessage: '请输入工艺包名称'
							},
							{
								minLength: 2,
								maxLength: 20,
								errorMessage: '长度在 2 到 20 个字符'
							}
						]
					},
					amplitude: {
						rules: [{
								required: true,
								errorMessage: '请输入焊枪摆幅'
							},
							{
								pattern: /^[0-9]+(\.[0-9]+)?$/,
								errorMessage: '请输入正确的数值'
							}
						]
					},
					electric: {
						rules: [{
								required: true,
								errorMessage: '请输入焊机电流'
							},
							{
								pattern: /^[0-9]+(\.[0-9]+)?$/,
								errorMessage: '请输入正确的数值'
							}
						]
					},
					speed: {
						rules: [{
								required: true,
								errorMessage: '请输入焊枪行进速度'
							},
							{
								pattern: /^[0-9]+(\.[0-9]+)?$/,
								errorMessage: '请输入正确的数值'
							}
						]
					},
					voltage: {
						rules: [{
								required: true,
								errorMessage: '请输入焊机弧长校正电压'
							},
							{
								pattern: /^[0-9]+(\.[0-9]+)?$/,
								errorMessage: '请输入正确的数值'
							}
						]
					}
				}
			}
		},
		mounted() {
			// 默认选中第一个工艺包
			if (this.weldParamList.length > 0) {
				this.weldParam = this.weldParamList[0].value;
				this.change(this.weldParam);
			}
		},
		methods: {
			change(value) {
				const selected = this.weldParamList.find(item => item.value === value);
				if (selected) {
					this.formData.amplitude = selected.amplitude;
					this.formData.electric = selected.electric;
					this.formData.speed = selected.speed;
					this.formData.voltage = selected.voltage;
				}
			},
			getWeldParamList() {
				this.$rest.getWeldParamList().then(res => {

				}).catch(err => {

				})
			},
			handleOpenDialog() {
				this.$refs.popup.open();
			},
			submitForm() {
				// 简单校验
				this.$refs.addForm.validate().then(() => {
					this.$sql.isOpenDatabase().then(res=>{
						console.log('打开数据库',res);
					}).catch(err=>{
						console.log(err);
					})
				}).catch(e => {

				})



			},
			closePopup(){
				this.$refs.popup.close();
			},
			changeDialog(e) {
				if (!e.show) {
					this.newForm = {
						name: '',
						amplitude: '',
						electric: '',
						speed: '',
						voltage: ''
					}
				}
			}
		}
	}
</script>

<style>
	.form-container {
		/* background-color: #fff; */
		/* padding: 20rpx; */
		margin: 30rpx;
		/* border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05); */
	}

	.uni-forms-item {
		margin-bottom: 20rpx;
	}

	.uni-data-select /deep/ .uni-select__input-text {
		color: #333;
	}

	.label-text {
		font-weight: bold;
		font-size: 28rpx;
		width: 400rpx;
	}

	.disabled-input {
		background-color: #f5f5f5;
		color: #666;
	}

	.add-param {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		/* 垂直居中 */
		justify-content: center;
	}

	.add-text {
		font-size: 28rpx;
		text-decoration: underline;
		/* 添加下划线 */
		/* color: black; */
	}

	.add-content {
		color: #00c3ff;
		margin: 0 4px;
	}

	.popup-box {
		background: #fff;
		border-radius: 8px;
		padding: 40rpx;
		width: 800rpx;
	}

	.popup-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 40rpx;
		color: black;
	}

	.popup-footer {
		/* display: flex;
		justify-content: flex-end; */
		align-items: center;
		overflow: hidden;

		/* 按钮间距，可选 */

	}

	.popup-footer .btn {
		float: right;
		margin-left: 40rpx;
		box-sizing: border-box;
	}

	::v-deep .uni-forms-item {
		margin-bottom: 40rpx;
		/* 你想要的上下间距 */
	}
</style>