"use client";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { BookOpen, Image as ImageIcon } from "lucide-react";
import { useToastLike } from "../components/toastFeedback";
import type { DailyDevotion, DailyPost, PostPaginator } from "../utils/schemas";
import { api } from "../utils/api/api_connection";
import TopBar from "../components/dashboard/TopBar";
import PostsPanel from "../components/dashboard/posts/PostsPanel";
import DevotionsPanel from "../components/dashboard/devotion/DevotionsPanel";

type DashboardDisplayMode = "posts" | "devotions";

export default function ComfortersLodgeAdmin() {
  const { show, node } = useToastLike();
  const [tab, setTab] = useState<DashboardDisplayMode>("posts");

  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [devotions, setDevotions] = useState<DailyDevotion[]>([]);

  const [postPaginator, setPostPaginator] = useState<PostPaginator>({
    page: 1,
    ttl_pages: 1,
  });

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingDevotions, setLoadingDevotions] = useState(false);

  const [errPosts, setErrPosts] = useState<string | null>(null);
  const [errDevotions, setErrDevotions] = useState<string | null>(null);

  const refreshPosts = async (page: number = postPaginator.page) => {
    setLoadingPosts(true);
    setErrPosts(null);
    try {
      const data = await api<{
        posts: DailyPost[];
        page: number;
        total_pages: number;
      }>(`/posts?page=${page}`);
      setPosts(data.posts as DailyPost[]);
      setPostPaginator({
        page: data.page,
        ttl_pages: data.total_pages,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrPosts(e?.message || "Failed to load posts");
      setPosts(posts);
      setPostPaginator(postPaginator);
    } finally {
      setLoadingPosts(false);
    }
  };

  const refreshDevotions = async () => {
    setLoadingDevotions(true);
    setErrDevotions(null);
    try {
      const data = await api<DailyDevotion[]>("/devotions");
      setDevotions(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrDevotions(e?.message || "Failed to load devotions");
      setDevotions(devotions);
    } finally {
      setLoadingDevotions(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshPosts(), refreshDevotions()]);
    show("Refreshed.");
  };

  useEffect(() => {
    // Initial load
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full bg-background">
      {node}

      <div className="px-4 md:px-12 lg:px-24 py-8">
        <TopBar
          active={tab}
          onRefresh={refreshAll}
          refreshing={loadingPosts || loadingDevotions}
        />

        <div className="mt-6">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as DashboardDisplayMode)}
          >
            <TabsList className="grid w-full grid-cols-2 pb-12">
              <TabsTrigger value="posts" className="gap-2 tab-style">
                <BookOpen className="h-4 w-4" /> Posts
              </TabsTrigger>
              <TabsTrigger value="devotions" className="gap-2 tab-style">
                <ImageIcon className="h-4 w-4" /> Devotions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              <PostsPanel
                posts={posts}
                loading={loadingPosts}
                error={errPosts}
                onReload={refreshPosts}
                onCreated={async () => {
                  await refreshPosts();
                  show("Posts updated.");
                }}
                onDeleted={async () => {
                  await refreshPosts();
                  show("Post deleted.");
                }}
                pagePaginator={postPaginator}
                onPageChange={async (page: number) => {
                  await refreshPosts(page);
                }}
              />
            </TabsContent>

            <TabsContent value="devotions" className="mt-6">
              <DevotionsPanel
                devotions={devotions}
                loading={loadingDevotions}
                error={errDevotions}
                onReload={refreshDevotions}
                onCreated={async () => {
                  await refreshDevotions();
                  show("Devotions updated.");
                }}
                onDeleted={async () => {
                  await refreshDevotions();
                  show("Devotion deleted.");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-10 text-xs text-muted-foreground">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>&copy; {new Date().getFullYear()} Comforters Lodge.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
