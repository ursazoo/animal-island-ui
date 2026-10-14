import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Card, Input, Select, Drawer } from '../../src';
const options = [
    { key: 'forest', label: '森间岛' },
    { key: 'sea', label: '海风岛' },
    { key: 'moon', label: '月光岛' },
];
export function Baseline() {
    const [value, setValue] = useState('forest');
    const [open, setOpen] = useState(false);
    return (
        <main style={{ padding: 24, background: '#f8f8f0', minHeight: '100vh', color: '#725d42' }}>
            <h2>原版 Web 组件</h2>
            <p>基线 commit 7981093</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Button type="primary">Primary</Button>
                    <Button>Default</Button>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Button disabled>Disabled</Button>
                    <Button loading>Loading</Button>
                </div>
                <Card>
                    <h3>奶油色的午后</h3>
                    <p>保留原版纸张般的颜色。</p>
                </Card>
                <Card pattern="app-teal">
                    <h3>青绿点阵卡片</h3>
                </Card>
                <Input defaultValue="小岛居民" allowClear />
                <Input shadow placeholder="带阴影输入框" />
                <Select options={options} value={value} onChange={setValue} />
                <Button onClick={() => setOpen(true)}>打开原版底部抽屉</Button>
            </div>
            <Drawer
                open={open}
                title="选择你的小岛"
                placement="bottom"
                height={330}
                onClose={() => setOpen(false)}
                pushBackground={false}
                footer={
                    <Button type="primary" onClick={() => setOpen(false)}>
                        确定
                    </Button>
                }
            >
                原版底部抽屉，用作颜色、圆角和阴影对照。
            </Drawer>
        </main>
    );
}
createRoot(document.getElementById('root')!).render(<Baseline />);
