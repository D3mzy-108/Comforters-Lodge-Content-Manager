"use client";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { BookOpen, Image as ImageIcon, Music2Icon } from "lucide-react";
import { useToastLike } from "../components/toastFeedback";
import type {
  DailyDevotion,
  DailyPost,
  DashboardDisplayMode,
  Hymn,
  PagePaginator,
} from "../utils/schemas";
import { api } from "../utils/api/api_connection";
import TopBar from "../components/dashboard/TopBar";
import PostsPanel from "../components/dashboard/posts/PostsPanel";
import DevotionsPanel from "../components/dashboard/devotion/DevotionsPanel";
import HymnsPanel from "../components/dashboard/hymns/HymnsPanel";

export default function ComfortersLodgeAdmin() {
  const { show, node } = useToastLike();
  const [tab, setTab] = useState<DashboardDisplayMode>("posts");

  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [devotions, setDevotions] = useState<DailyDevotion[]>([]);
  const [hymns, setHymns] = useState<Hymn[]>([]);

  const [postPaginator, setPostPaginator] = useState<PagePaginator>({
    page: 1,
    ttl_pages: 1,
    progress: null,
  });
  const [devotionalPaginator, setDevotionalPaginator] = useState<PagePaginator>(
    {
      page: 1,
      ttl_pages: 1,
      progress: null,
    }
  );
  const [hymnsPaginator, setHymnsPaginator] = useState<PagePaginator>({
    page: 1,
    ttl_pages: null,
    progress: "0 of 0",
  });
  const HYMN_PAGE_SIZE = 30;
  const [TOTAL_HYMNS, SET_TOTAL_HYMNS] = useState(0);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingDevotions, setLoadingDevotions] = useState(false);
  const [loadingHymns, setLoadingHymns] = useState(false);

  const [errPosts, setErrPosts] = useState<string | null>(null);
  const [errDevotions, setErrDevotions] = useState<string | null>(null);
  const [errHymns, setErrHymns] = useState<string | null>(null);

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
        progress: null,
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

  const refreshDevotions = async (page: number = devotionalPaginator.page) => {
    setLoadingDevotions(true);
    setErrDevotions(null);
    try {
      const data = await api<{
        devotionals: DailyDevotion[];
        page: number;
        total_pages: number;
      }>(`/devotions?page=${page}`);
      setDevotions(data.devotionals);
      setDevotionalPaginator({
        page: data.page,
        ttl_pages: data.total_pages,
        progress: null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrDevotions(e?.message || "Failed to load devotions");
      setDevotions(devotions);
      setDevotionalPaginator(devotionalPaginator);
    } finally {
      setLoadingDevotions(false);
    }
  };

  const refreshHymns = async (page: number = hymnsPaginator.page) => {
    setLoadingHymns(true);
    setErrDevotions(null);
    try {
      const data = await api<{
        hymns: Hymn[];
        page: number;
        totalHymns: number;
      }>(`/hymns?page=${page}`);
      setHymns(data.hymns);
      const offset = (page - 1) * HYMN_PAGE_SIZE;
      setHymnsPaginator({
        page: data.page,
        ttl_pages: null,
        progress: `${offset + 1}-${
          data.totalHymns > HYMN_PAGE_SIZE
            ? offset + HYMN_PAGE_SIZE
            : data.totalHymns
        } of ${data.totalHymns}`,
      });
      SET_TOTAL_HYMNS(data.totalHymns);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrHymns(e?.message || "Failed to load devotions");
      setHymns(hymns);
      setHymnsPaginator(hymnsPaginator);
    } finally {
      setLoadingHymns(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshPosts(), refreshDevotions(), refreshHymns()]);
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
            <TabsList className="grid w-full grid-cols-3 pb-12 max-w-screen">
              <TabsTrigger value="posts" className="gap-2 tab-style h-full">
                <div className="flex gap-2 items-center">
                  <BookOpen className="size-4 md:size-5" />
                  <span className="text-base md:text-lg">Posts</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="devotions" className="gap-2 tab-style h-full">
                <div className="flex gap-2 items-center">
                  <ImageIcon className="size-4 md:size-5" />
                  <span className="text-base md:text-lg">Devotions</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="hymns" className="gap-2 tab-style h-full">
                <div className="flex gap-2 items-center">
                  <Music2Icon className="size-4 md:size-5" />
                  <span className="text-base md:text-lg">Hymns</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              <PostsPanel
                posts={posts}
                loading={loadingPosts}
                error={errPosts}
                onReload={() => refreshPosts(postPaginator.page)}
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
                onReload={() => refreshDevotions(devotionalPaginator.page)}
                onCreated={async () => {
                  await refreshDevotions();
                  show("Devotions updated.");
                }}
                onDeleted={async () => {
                  await refreshDevotions();
                  show("Devotion deleted.");
                }}
                pagePaginator={devotionalPaginator}
                onPageChange={async (page: number) => {
                  await refreshDevotions(page);
                }}
              />
            </TabsContent>

            <TabsContent value="hymns" className="mt-6">
              <HymnsPanel
                hymns={hymns}
                error={errHymns}
                loading={loadingHymns}
                onReload={() => refreshHymns(hymnsPaginator.page)}
                onCreated={async () => {
                  await refreshHymns();
                  show("Hymns updated.");
                }}
                onDeleted={async () => {
                  await refreshHymns();
                  show("Hymn deleted.");
                }}
                onPageChange={async (page: number) => {
                  await refreshHymns(page);
                }}
                pagePaginator={hymnsPaginator}
                isLastPage={
                  (hymnsPaginator.page - 1) * HYMN_PAGE_SIZE + HYMN_PAGE_SIZE >=
                  TOTAL_HYMNS
                }
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
