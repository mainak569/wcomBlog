import { db } from "@/lib/db";
import Searchbar from "@/components/Searchbar";
import MobileFilters from "@/components/global/MobileFilters";
import { CollectionPageFilters } from "@/constants/filters";
import Filters from "@/components/global/Filters";
import QuestionCard from "@/components/global/QuestionCard";
import NoResult from "@/components/global/NoResult";
import CustomPagination from "@/components/global/CustomPagination";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const page = async ({
  searchParams,
}: {
  searchParams: {
    page: number;
    filter: string;
    q: string;
  };
}) => {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/");
  }

  const pageNo = searchParams.page ? searchParams.page : 0;

  const collection = await db.collection.findMany({
    skip: 10 * Number(pageNo),
    take: 10,
    include: {
      question: {
        include: {
          tags: true,
          answer: true,
          downvotes: true,
          saves: true,
          upvotes: true,
        },
      },
    },
    where: {
      question: {
        title: {
          contains: searchParams.q,
        },
      },
    },
    orderBy: {
      createdAt: searchParams.filter === "recent" ? "desc" : "asc",
    },
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      {collection.length > 0 && (
        <>
          <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
            <Searchbar
              route="/"
              iconPosition="left"
              imgSrc="/assets/icons/search.svg"
              placeholder="Search for questions"
              otherClasses="flex-1"
            />
            {/* MobileFilters */}
            <MobileFilters
              filters={CollectionPageFilters}
              otherClasses="min-h-[56px] sm:min-w-[170px]"
              containerClasses="hidden max-md:flex"
            />
          </div>
          <Filters filters={CollectionPageFilters} />
        </>
      )}
      <div className="mt-10 flex w-full flex-col gap-6">
        {collection?.length! > 0 ? (
          <>
            {collection?.map(async (coll) => {
              const user = await db.user.findUnique({
                where: {
                  userId: coll.question.userId,
                },
              });
              return (
                <QuestionCard
                  key={coll.id}
                  question={coll.question}
                  answers={coll.question.answer}
                  user={user}
                  tags={coll.question.tags}
                  Upvotes={coll.question.upvotes}
                />
              );
            })}
            {collection?.length > 10 && (
              <div className="mt-10">
                <CustomPagination
                  page={searchParams.page}
                  length={collection.length}
                />
              </div>
            )}
          </>
        ) : (
          <NoResult
            title="There’s no Saved question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/askQuestion"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
};

export default page;
